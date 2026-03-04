// cd C:\Users\nicol\OneDrive\Desktop\Programmieren\Einkaufsliste2\einkaufsliste-ts
// npm start


import "./App.css";
import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import Login from "./Login";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  getDocs,
} from "firebase/firestore";

interface Item {
  id: string;
  name: string;
  checked?: boolean;
}

interface SimpleDoc {
  id: string;
  name: string;
}

type Page = "shopping" | "menus" | "recipes" | "settings";
type ConfirmDeleteAction = () => Promise<void>;

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState<Page>("shopping");
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  const [shoppingItems, setShoppingItems] = useState<Item[]>([]);
  const [menus, setMenus] = useState<SimpleDoc[]>([]);
  const [recipes, setRecipes] = useState<SimpleDoc[]>([]);

  const [input, setInput] = useState("");
  const [menuInput, setMenuInput] = useState("");
  const [recipeInput, setRecipeInput] = useState("");


  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const [selectedMenu, setSelectedMenu] = useState<SimpleDoc | null>(null);
  const [menuProducts, setMenuProducts] = useState<Item[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [menuProductInput, setMenuProductInput] = useState("");

  // 🔗 Menü Links
  interface LinkItem {
  id: string;
  url: string;
}
const [menuLinks, setMenuLinks] = useState<LinkItem[]>([]);
const [menuLinkInput, setMenuLinkInput] = useState("");


const [selectedRecipe, setSelectedRecipe] = useState<SimpleDoc | null>(null);
const [recipeProducts, setRecipeProducts] = useState<Item[]>([]);
const [selectedRecipeProducts, setSelectedRecipeProducts] = useState<string[]>([]);
const [recipeProductInput, setRecipeProductInput] = useState("");

const [recipeLinks, setRecipeLinks] = useState<LinkItem[]>([]);
const [recipeLinkInput, setRecipeLinkInput] = useState("");
const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
const [deleteConfirmMessage, setDeleteConfirmMessage] = useState("");
const [deleteConfirmLoading, setDeleteConfirmLoading] = useState(false);
const [deleteAction, setDeleteAction] = useState<ConfirmDeleteAction | null>(null);





  // ?? Auth
  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  // 🛒 Einkaufsliste
  useEffect(() => {
    if (!user) return;
    return onSnapshot(
      collection(db, "users", user.uid, "shoppingItems"),
      (snap) =>
        setShoppingItems(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as any),
          }))
        )
    );
  }, [user]);

  // Menüs
  useEffect(() => {
    if (!user) return;
    return onSnapshot(
      collection(db, "users", user.uid, "menus"),
      (snap) =>
        setMenus(
          snap.docs.map((d) => ({
            id: d.id,
            name: d.data().name,
          }))
        )
    );
  }, [user]);

  // 📖 Rezepte
  useEffect(() => {
    if (!user) return;
    return onSnapshot(
      collection(db, "users", user.uid, "recipes"),
      (snap) =>
        setRecipes(
          snap.docs.map((d) => ({
            id: d.id,
            name: d.data().name,
          }))
        )
    );
  }, [user]);

  // Menü Produkte
  useEffect(() => {
  if (!user || !selectedMenu) return;

  return onSnapshot(
    collection(
      db,
      "users",
      user.uid,
      "menus",
      selectedMenu.id,
      "products"
    ),
    snap =>
      setMenuProducts(
        snap.docs.map(d => ({
          id: d.id,
          ...(d.data() as any),
        }))
      )
  );
}, [user, selectedMenu]);

// 🔗 Menü Links
useEffect(() => {
  if (!user || !selectedMenu) return;

  return onSnapshot(
    collection(
      db,
      "users",
      user.uid,
      "menus",
      selectedMenu.id,
      "links"
    ),
    snap =>
      setMenuLinks(
        snap.docs.map(d => ({
          id: d.id,
          url: d.data().url,
        }))
      )
  );
}, [user, selectedMenu]);


// Produkte im Rezept
useEffect(() => {
  if (!user || !selectedRecipe) return;

  return onSnapshot(
    collection(db, "users", user.uid, "recipes", selectedRecipe.id, "products"),
    snap => setRecipeProducts(
      snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))
    )
  );
}, [user, selectedRecipe]);

// Links im Rezept
useEffect(() => {
  if (!user || !selectedRecipe) return;

  return onSnapshot(
    collection(db, "users", user.uid, "recipes", selectedRecipe.id, "links"),
    snap => setRecipeLinks(
      snap.docs.map(d => ({ id: d.id, url: d.data().url }))
    )
  );
}, [user, selectedRecipe]);





  if (!user) return <Login onLogin={() => {}} />;

  const openDeleteConfirm = (message: string, action: ConfirmDeleteAction) => {
    setDeleteConfirmMessage(message);
    setDeleteAction(() => action);
    setDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    if (deleteConfirmLoading) return;
    setDeleteConfirmOpen(false);
    setDeleteConfirmMessage("");
    setDeleteAction(null);
  };

  const runDeleteConfirm = async () => {
    if (!deleteAction) return;
    setDeleteConfirmLoading(true);
    try {
      await deleteAction();
      setDeleteConfirmOpen(false);
      setDeleteConfirmMessage("");
      setDeleteAction(null);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleteConfirmLoading(false);
    }
  };

  // ➕ Einkauf
  const addItem = async () => {
    if (!input) return;
    await addDoc(collection(db, "users", user.uid, "shoppingItems"), {
      name: input,
      checked: false,
    });
    setInput("");
  };

  const toggleItem = async (item: Item) => {
    await updateDoc(
      doc(db, "users", user.uid, "shoppingItems", item.id),
      { checked: !item.checked }
    );
  };

  const deleteChecked = () => {
    const checkedItems = shoppingItems.filter((i) => i.checked);
    if (!checkedItems.length) return;

    openDeleteConfirm(
      `Willst du ${checkedItems.length} ausgewählte Einträge wirklich löschen?`,
      async () => {
        for (const item of checkedItems) {
          await deleteDoc(
            doc(db, "users", user.uid, "shoppingItems", item.id)
          );
        }
      }
    );
  };

  // ➕ Menü
  const addMenu = async () => {
    const name = menuInput.trim();
    if (!name) return;
    await addDoc(collection(db, "users", user.uid, "menus"), { name });
    setMenuInput("");
  };

  // ➕ Rezept
  const addRecipe = async () => {
    const name = recipeInput.trim();
    if (!name) return;
    await addDoc(collection(db, "users", user.uid, "recipes"), { name });
    setRecipeInput("");
  };

  //Einkaufsliste bearbeiten & löschen
  const updateItemName = async (item: Item) => {
  await updateDoc(
    doc(db, "users", user.uid, "shoppingItems", item.id),
    { name: editValue }
  );
  setEditingId(null);
};

const deleteItem = (id: string) => {
  openDeleteConfirm("Willst du diesen Eintrag wirklich löschen?", async () => {
    await deleteDoc(
      doc(db, "users", user.uid, "shoppingItems", id)
    );
  });
};

//Menüs bearbeiten & löschen
const updateMenuName = async (menu: SimpleDoc) => {
  await updateDoc(
    doc(db, "users", user.uid, "menus", menu.id),
    { name: editValue }
  );
  setEditingId(null);
};

const deleteMenu = (id: string) => {
  openDeleteConfirm("Willst du dieses Menue wirklich löschen?", async () => {
    await deleteDoc(
      doc(db, "users", user.uid, "menus", id)
    );
  });
};

//Rezepte bearbeiten & löschen
const updateRecipeName = async (recipe: SimpleDoc) => {
  await updateDoc(
    doc(db, "users", user.uid, "recipes", recipe.id),
    { name: editValue }
  );
  setEditingId(null);
};

const deleteRecipe = (id: string) => {
  openDeleteConfirm("Willst du dieses Rezept wirklich löschen?", async () => {
    await deleteDoc(
      doc(db, "users", user.uid, "recipes", id)
    );
  });
};

//Menü Produkte hinzufügen
const addMenuProduct = async () => {
  if (!menuProductInput || !selectedMenu) return;

  await addDoc(
    collection(
      db,
      "users",
      user.uid,
      "menus",
      selectedMenu.id,
      "products"
    ),
    { name: menuProductInput }
  );

  setMenuProductInput("");
};

// ?? Menü-Produkt umbenennen
const updateMenuProductName = async (productId: string) => {
  if (!selectedMenu || !editValue) return;

  await updateDoc(
    doc(
      db,
      "users",
      user.uid,
      "menus",
      selectedMenu.id,
      "products",
      productId
    ),
    { name: editValue }
  );

  setEditingId(null);
  setEditValue("");
};

// ??? Menü-Produkt löschen
const deleteMenuProduct = (productId: string) => {
  if (!selectedMenu) return;

  openDeleteConfirm("Willst du dieses Produkt wirklich löschen?", async () => {
    await deleteDoc(
      doc(
        db,
        "users",
        user.uid,
        "menus",
        selectedMenu.id,
        "products",
        productId
      )
    );
  });
};

// ✅ Menü-Produkt auswählen / abwählen
const toggleSelectProduct = (id: string) => {
  setSelectedProducts(prev =>
    prev.includes(id)
      ? prev.filter(p => p !== id)
      : [...prev, id]
  );
};

const selectedToShoppingList = async () => {
  for (const id of selectedProducts) {
    const product = menuProducts.find(p => p.id === id);
    if (!product) continue;

    await addDoc(
      collection(db, "users", user.uid, "shoppingItems"),
      { name: product.name, checked: false }
    );
  }

  setSelectedProducts([]);
};


// ➕ Link hinzufügen
const addMenuLink = async () => {
  if (!menuLinkInput || !selectedMenu) return;

  await addDoc(
    collection(
      db,
      "users",
      user.uid,
      "menus",
      selectedMenu.id,
      "links"
    ),
    { url: menuLinkInput }
  );

  setMenuLinkInput("");
};

// ?? Link bearbeiten
const updateMenuLink = async (linkId: string) => {
  if (!selectedMenu || !editValue) return;

  await updateDoc(
    doc(
      db,
      "users",
      user.uid,
      "menus",
      selectedMenu.id,
      "links",
      linkId
    ),
    { url: editValue }
  );

  setEditingId(null);
  setEditValue("");
};

// ??? Link löschen
const deleteMenuLink = (linkId: string) => {
  if (!selectedMenu) return;

  openDeleteConfirm("Willst du diesen Link wirklich löschen?", async () => {
    await deleteDoc(
      doc(
        db,
        "users",
        user.uid,
        "menus",
        selectedMenu.id,
        "links",
        linkId
      )
    );
  });
};



// Produkte
const addRecipeProduct = async () => {
  if (!recipeProductInput || !selectedRecipe) return;

  await addDoc(
    collection(db, "users", user.uid, "recipes", selectedRecipe.id, "products"),
    { name: recipeProductInput }
  );
  setRecipeProductInput("");
};

const toggleSelectRecipeProduct = (id: string) => {
  setSelectedRecipeProducts(prev =>
    prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
  );
};

const updateRecipeProductName = async (id: string) => {
  if (!selectedRecipe || !editValue) return;
  await updateDoc(
    doc(db, "users", user.uid, "recipes", selectedRecipe.id, "products", id),
    { name: editValue }
  );
  setEditingId(null);
  setEditValue("");
};

const deleteRecipeProduct = (id: string) => {
  if (!selectedRecipe) return;

  openDeleteConfirm("Willst du dieses Produkt wirklich löschen?", async () => {
    await deleteDoc(
      doc(db, "users", user.uid, "recipes", selectedRecipe.id, "products", id)
    );
  });
};

// Links
const addRecipeLink = async () => {
  if (!recipeLinkInput || !selectedRecipe) return;

  await addDoc(
    collection(db, "users", user.uid, "recipes", selectedRecipe.id, "links"),
    { url: recipeLinkInput }
  );
  setRecipeLinkInput("");
};

const updateRecipeLink = async (id: string) => {
  if (!selectedRecipe || !editValue) return;
  await updateDoc(
    doc(db, "users", user.uid, "recipes", selectedRecipe.id, "links", id),
    { url: editValue }
  );
  setEditingId(null);
  setEditValue("");
};

const deleteRecipeLink = (id: string) => {
  if (!selectedRecipe) return;

  openDeleteConfirm("Willst du diesen Link wirklich löschen?", async () => {
    await deleteDoc(
      doc(db, "users", user.uid, "recipes", selectedRecipe.id, "links", id)
    );
  });
};

const copySelectedRecipesToMenu = async () => {
  if (!user) return;

  for (const recipeId of selectedRecipeProducts) {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) continue;

    // Neues Menü anlegen mit Rezeptname
    const menuRef = await addDoc(
      collection(db, "users", user.uid, "menus"),
      { name: recipe.name }
    );

    // Produkte des Rezepts holen
    const productsSnap = await getDocs(
      collection(db, "users", user.uid, "recipes", recipeId, "products")
    );
    for (const p of productsSnap.docs) {
      await addDoc(
        collection(db, "users", user.uid, "menus", menuRef.id, "products"),
        { name: p.data().name }
      );
    }

    // Links des Rezepts kopieren
    const linksSnap = await getDocs(
      collection(db, "users", user.uid, "recipes", recipeId, "links")
    );
    for (const l of linksSnap.docs) {
      await addDoc(
        collection(db, "users", user.uid, "menus", menuRef.id, "links"),
        { url: l.data().url }
      );
    }
  }

  // Checkboxen zurücksetzen
  setSelectedRecipeProducts([]);
};

const syncLatestVersion = async () => {
  setSyncing(true);
  setSyncMessage("Synchronisierung läuft...");

  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map((registration) => registration.unregister())
      );
    }

    if ("caches" in window) {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((key) => caches.delete(key)));
    }

    setSyncMessage("Neueste Version wird geladen...");
    const basePath = process.env.PUBLIC_URL || "";
    window.location.replace(`${basePath}/?sync=${Date.now()}`);
  } catch (error) {
    console.error("Synchronisierung fehlgeschlagen:", error);
    setSyncMessage("Synchronisierung fehlgeschlagen. Bitte Seite neu laden.");
    setSyncing(false);
  }
};

return (
  <div className="app-container">
    <h1 className="app-title">
      {user.email?.slice(0, 10)}'s Einkaufsliste 🛒
    </h1>

    {/* ===================== 🛒 EINKAUFSLISTE ===================== */}
    {page === "shopping" && (
      <div className="shopping-container">
        {/* Input + Add Button */}
        <div className="input-row">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Produkt"
            className="app-input"
          />
          <button onClick={addItem} className="add-button">
            +
          </button>
        </div>

        {/* Liste der Produkte */}
        {shoppingItems.map((i) => (
          <div key={i.id} className="item-row">
            <input
              type="checkbox"
              checked={i.checked}
              onChange={() => toggleItem(i)}
              className="item-checkbox"
            />

            {editingId === i.id ? (
              <>
                <input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="app-input edit-input"
                />
                <button onClick={() => updateItemName(i)} className="edit">
                  💾
                </button>
                <button onClick={() => setEditingId(null)} className="delete">
                  ?
                </button>
              </>
            ) : (
              <>
                <span className="item-text">{i.name}</span>
                <button
                  onClick={() => {
                    setEditingId(i.id);
                    setEditValue(i.name);
                  }}
                  className="edit"
                >
                  ✏️
                </button>
                <button onClick={() => deleteItem(i.id)} className="delete">
                  🗑️
                </button>
              </>
            )}
          </div>
        ))}

        <button onClick={deleteChecked} className="delete-selected">
          Ausgewählte löschen
        </button>
      </div>
    )}

    {/* ===================== MENÜS ===================== */}
    {page === "menus" && !selectedMenu && (
      <div className="menus-container">
        <div className="input-row">
          <input
            value={menuInput}
            onChange={(e) => setMenuInput(e.target.value)}
            placeholder="Menü"
            className="app-input"
          />
          <button onClick={addMenu} className="add-button">
            +
          </button>
        </div>

        {menus.map((m) => (
          <div key={m.id} className="menu-row">
            <span
              className="menu-name"
              onClick={() => {
                setSelectedMenu(m);
                setSelectedProducts([]);
              }}
            >
              {m.name}
            </span>

            {editingId === m.id ? (
              <>
                <input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="app-input edit-input"
                />
                <button onClick={() => updateMenuName(m)} className="edit">
                  💾
                </button>
                <button onClick={() => setEditingId(null)} className="delete">
                  ?
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setEditingId(m.id);
                    setEditValue(m.name);
                  }}
                  className="edit"
                >
                  ✏️
                </button>
                <button onClick={() => deleteMenu(m.id)} className="delete">
                  🗑️
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    )}

    {/* ===================== MENÜ DETAIL ===================== */}
    {page === "menus" && selectedMenu && (
      <div className="menu-detail">
        <h2 className="menu-title">{selectedMenu.name}</h2>

        <div className="input-row">
          <input
            value={menuProductInput}
            onChange={(e) => setMenuProductInput(e.target.value)}
            placeholder="Produkt hinzufügen"
            className="app-input"
          />
          <button onClick={addMenuProduct} className="add-button">
            +
          </button>
        </div>

        {menuProducts.map((p) => (
          <div key={p.id} className="item-row">
            <input
              type="checkbox"
              checked={selectedProducts.includes(p.id)}
              onChange={() => toggleSelectProduct(p.id)}
              className="item-checkbox"
            />

            {editingId === p.id ? (
              <>
                <input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="app-input edit-input"
                />
                <button
                  onClick={() => updateMenuProductName(p.id)}
                  className="edit"
                >
                  💾
                </button>
                <button onClick={() => setEditingId(null)} className="delete">
                  ?
                </button>
              </>
            ) : (
              <>
                <span className="item-text">{p.name}</span>
                <button
                  onClick={() => {
                    setEditingId(p.id);
                    setEditValue(p.name);
                  }}
                  className="edit"
                >
                  ✏️
                </button>
                <button
                  onClick={() => deleteMenuProduct(p.id)}
                  className="delete"
                >
                  🗑️
                </button>
              </>
            )}
          </div>
        ))}

        <button onClick={selectedToShoppingList} className="add-to-shopping">
          ➜ Einkaufsliste
        </button>

        <hr />

        <h3>🔗 Links</h3>
        <div className="input-row">
          <input
            value={menuLinkInput}
            onChange={(e) => setMenuLinkInput(e.target.value)}
            placeholder="https://..."
            className="app-input"
          />
          <button onClick={addMenuLink} className="add-button">
            +
          </button>
        </div>

        {menuLinks.map((link) => (
          <div key={link.id} className="link-row">
            {editingId === link.id ? (
              <>
                <input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="app-input edit-input"
                />
                <button
                  onClick={() => updateMenuLink(link.id)}
                  className="edit"
                >
                  💾
                </button>
                <button onClick={() => setEditingId(null)} className="delete">
                  ?
                </button>
              </>
            ) : (
              <>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="link-text"
                >
                  Link
                </a>
                <button
                  onClick={() => {
                    setEditingId(link.id);
                    setEditValue(link.url);
                  }}
                  className="edit"
                >
                  ✏️
                </button>
                <button onClick={() => deleteMenuLink(link.id)} className="delete">
                  🗑️
                </button>
              </>
            )}
          </div>
        ))}

        <button
          onClick={() => setSelectedMenu(null)}
          className="back-button"
        >
          ⬅ Zurück
        </button>
      </div>
    )}

    {/* ===================== 📖 REZEPTE ===================== */}
    {page === "recipes" && !selectedRecipe && (
      <div className="recipes-container">
        <div className="input-row">
          <input
            value={recipeInput}
            onChange={(e) => setRecipeInput(e.target.value)}
            placeholder="Rezept"
            className="app-input"
          />
          <button onClick={addRecipe} className="add-button">
            +
          </button>
        </div>

        {recipes.map((r) => (
          <div key={r.id} className="recipe-row">
            <input
              type="checkbox"
              checked={selectedRecipeProducts.includes(r.id)}
              onChange={(e) => {
                e.stopPropagation();
                toggleSelectRecipeProduct(r.id);
              }}
              className="item-checkbox"
            />

            <span
              className="recipe-name"
              onClick={() => setSelectedRecipe(r)}
            >
              {r.name}
            </span>

            {editingId === r.id ? (
              <>
                <input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="app-input edit-input"
                />
                <button onClick={() => updateRecipeName(r)} className="edit">
                  💾
                </button>
                <button onClick={() => setEditingId(null)} className="delete">
                  ?
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingId(r.id);
                    setEditValue(r.name);
                  }}
                  className="edit"
                >
                  ✏️
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteRecipe(r.id);
                  }}
                  className="delete"
                >
                  🗑️
                </button>
              </>
            )}
          </div>
        ))}

        <button onClick={copySelectedRecipesToMenu} className="add-to-menu">
          ➜ Ausgewählte in Menü
        </button>
      </div>
    )}

    {/* ===================== 📖 REZEPT DETAIL ===================== */}
    {page === "recipes" && selectedRecipe && (
      <div className="recipe-detail">
        <h2 className="recipe-title">📖 {selectedRecipe.name}</h2>

        <div className="input-row">
          <input
            value={recipeProductInput}
            onChange={(e) => setRecipeProductInput(e.target.value)}
            placeholder="Produkt hinzufügen"
            className="app-input"
          />
          <button onClick={addRecipeProduct} className="add-button">
            +
          </button>
        </div>

        {recipeProducts.map((p) => (
          <div key={p.id} className="item-row">
            <input
              type="checkbox"
              checked={selectedRecipeProducts.includes(p.id)}
              onChange={() => toggleSelectRecipeProduct(p.id)}
              className="item-checkbox"
            />

            {editingId === p.id ? (
              <>
                <input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="app-input edit-input"
                />
                <button
                  onClick={() => updateRecipeProductName(p.id)}
                  className="edit"
                >
                  💾
                </button>
                <button onClick={() => setEditingId(null)} className="delete">
                  ?
                </button>
              </>
            ) : (
              <>
                <span className="item-text">{p.name}</span>
                <button
                  onClick={() => {
                    setEditingId(p.id);
                    setEditValue(p.name);
                  }}
                  className="edit"
                >
                  ✏️
                </button>
                <button
                  onClick={() => deleteRecipeProduct(p.id)}
                  className="delete"
                >
                  🗑️
                </button>
              </>
            )}
          </div>
        ))}

        <hr />

        <h3>🔗 Links</h3>
        <div className="input-row">
          <input
            value={recipeLinkInput}
            onChange={(e) => setRecipeLinkInput(e.target.value)}
            placeholder="https://..."
            className="app-input"
          />
          <button onClick={addRecipeLink} className="add-button">
            +
          </button>
        </div>

        {recipeLinks.map((link) => (
          <div key={link.id} className="link-row">
            {editingId === link.id ? (
              <>
                <input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="app-input edit-input"
                />
                <button
                  onClick={() => updateRecipeLink(link.id)}
                  className="edit"
                >
                  💾
                </button>
                <button onClick={() => setEditingId(null)} className="delete">
                  ?
                </button>
              </>
            ) : (
              <>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="link-text"
                >
                  Link
                </a>
                <button
                  onClick={() => {
                    setEditingId(link.id);
                    setEditValue(link.url);
                  }}
                  className="edit"
                >
                  ✏️
                </button>
                <button onClick={() => deleteRecipeLink(link.id)} className="delete">
                  🗑️
                </button>
              </>
            )}
          </div>
        ))}

        <button
          onClick={() => setSelectedRecipe(null)}
          className="back-button"
        >
          ⬅ Zurück
        </button>
      </div>
    )}

    {deleteConfirmOpen && (
      <div className="confirm-overlay" onClick={closeDeleteConfirm}>
        <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
          <h3>Löschen bestätigen</h3>
          <p>{deleteConfirmMessage}</p>
          <div className="confirm-actions">
            <button
              onClick={closeDeleteConfirm}
              className="back-button"
              disabled={deleteConfirmLoading}
            >
              Abbrechen
            </button>
            <button
              onClick={runDeleteConfirm}
              className="delete"
              disabled={deleteConfirmLoading}
            >
              {deleteConfirmLoading ? "Lösche..." : "Löschen"}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ===================== BOTTOM NAV ===================== */}
    {page === "settings" && (
      <div className="menus-container">
        <h2>Einstellungen</h2>
        <p className="settings-text">
          Falls die PWA noch eine alte Version zeigt, hier auf Synchronisieren klicken.
          Die App lädt danach direkt die neueste Version.
        </p>
        <button
          onClick={syncLatestVersion}
          className="add-to-shopping"
          disabled={syncing}
        >
          {syncing ? "Synchronisiere..." : "Jetzt synchronisieren"}
        </button>
        {syncMessage && <p className="settings-text">{syncMessage}</p>}
      </div>
    )}

    <div className="bottom-nav">
      <div onClick={() => setPage("shopping")}>🛒<br />Liste</div>
      <div
        onClick={() => {
          setSelectedMenu(null);
          setPage("menus");
        }}
      >
        📅<br />Menüs
      </div>
      <div
        onClick={() => {
          setSelectedRecipe(null);
          setPage("recipes");
        }}
      >
        📖<br />Rezepte
      </div>
      <div onClick={() => setPage("settings")}>⚙️<br />Einstellungen</div>
    </div>
  </div>
);





}





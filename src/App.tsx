import { useCallback, useEffect, useState } from "react";
import "./App.css";

type Item = {
  id: string;
  name: string;
  quantity: string;
  bought: boolean;
};

const STORAGE_KEY = "spisok-pokupok-items";

function loadItems(): Item[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is Item =>
        typeof x === "object" &&
        x !== null &&
        "id" in x &&
        "name" in x &&
        "quantity" in x &&
        "bought" in x &&
        typeof (x as Item).id === "string" &&
        typeof (x as Item).name === "string" &&
        typeof (x as Item).quantity === "string" &&
        typeof (x as Item).bought === "boolean"
    );
  } catch {
    return [];
  }
}

export default function App() {
  const [items, setItems] = useState<Item[]>(loadItems);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const add = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: trimmed,
        quantity: quantity.trim() || "—",
        bought: false,
      },
    ]);
    setName("");
    setQuantity("");
  }, [name, quantity]);

  const toggleBought = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, bought: !i.bought } : i))
    );
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>Список покупок</h1>
      </header>

      <main className="main">
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            add();
          }}
        >
          <label className="field">
            <span className="label">Товар</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например, молоко"
              autoComplete="off"
            />
          </label>
          <label className="field">
            <span className="label">Количество</span>
            <input
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="1 л, 500 г"
              autoComplete="off"
            />
          </label>
          <button type="submit" className="btn btn-primary">
            Добавить
          </button>
        </form>

        <section className="list-section" aria-label="Список товаров">
          {items.length === 0 ? (
            <p className="empty">Пока пусто — добавьте первый товар.</p>
          ) : (
            <ul className="list">
              {items.map((item) => (
                <li
                  key={item.id}
                  className={`list-item${item.bought ? " list-item--bought" : ""}`}
                >
                  <div className="list-item-main">
                    <button
                      type="button"
                      className="checkbox-wrap"
                      onClick={() => toggleBought(item.id)}
                      aria-pressed={item.bought}
                      title={item.bought ? "Снять отметку" : "Отметить куплено"}
                    >
                      <span
                        className={`checkbox${item.bought ? " checkbox--on" : ""}`}
                        aria-hidden
                      />
                    </button>
                    <div className="list-item-text">
                      <span className="list-item-name">{item.name}</span>
                      <span className="list-item-qty">{item.quantity}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-delete"
                    onClick={() => remove(item.id)}
                    aria-label={`Удалить «${item.name}»`}
                  >
                    Удалить
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

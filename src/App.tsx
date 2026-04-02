import { useCallback, useEffect, useState } from "react";
import "./App.css";

type Item = {
  id: string;
  name: string;
  quantity: number;
  bought: boolean;
};

type Filter = "all" | "bought" | "not-bought";

const STORAGE_KEY = "spisok-pokupok-items";
const MAX_NAME_LENGTH = 20;

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
        typeof (x as Item).quantity === "number" &&
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
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const add = useCallback(() => {
    const trimmedName = name.trim();
    const trimmedQuantity = quantity.trim();

    if (!trimmedName) {
      setError("Введите название товара, пожалуйста.");
      return;
    }

    if (!trimmedQuantity) {
      setError("Укажите количество: целое число от 1 и больше.");
      return;
    }

    const numericQuantity = Number(trimmedQuantity);
    const isInteger = Number.isInteger(numericQuantity);
    if (!isInteger || numericQuantity < 1) {
      setError("Количество должно быть целым числом: 1, 2, 3 и т.д.");
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: trimmedName,
        quantity: numericQuantity,
        bought: false,
      },
    ]);
    setName("");
    setQuantity("");
    setError("");
  }, [name, quantity]);

  const toggleBought = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, bought: !i.bought } : i))
    );
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const visibleItems = items.filter((item) => {
    if (filter === "bought") return item.bought;
    if (filter === "not-bought") return !item.bought;
    return true;
  });

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
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="Например, молоко"
              autoComplete="off"
              maxLength={MAX_NAME_LENGTH}
            />
          </label>
          <label className="field">
            <span className="label">Количество</span>
            <input
              type="number"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setError("");
              }}
              placeholder="1"
              autoComplete="off"
              min={1}
              step={1}
            />
          </label>
          {error ? <p className="error">{error}</p> : null}
          <button type="submit" className="btn btn-primary">
            Добавить
          </button>
        </form>

        <section className="filters" aria-label="Фильтр списка">
          <button
            type="button"
            className={`btn btn-filter${filter === "all" ? " btn-filter--active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Все
          </button>
          <button
            type="button"
            className={`btn btn-filter${filter === "bought" ? " btn-filter--active" : ""}`}
            onClick={() => setFilter("bought")}
          >
            Куплено
          </button>
          <button
            type="button"
            className={`btn btn-filter${
              filter === "not-bought" ? " btn-filter--active" : ""
            }`}
            onClick={() => setFilter("not-bought")}
          >
            Не куплено
          </button>
        </section>

        <section className="list-section" aria-label="Список товаров">
          {visibleItems.length === 0 ? (
            <p className="empty">Пока пусто — добавьте первый товар.</p>
          ) : (
            <ul className="list">
              {visibleItems.map((item) => (
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

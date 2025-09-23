import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import "./header.scss";
import { useSelector } from "react-redux";
import { selectCart } from "../../redux/features/cartSlice";
import type { CartItem } from "../../models/CartItem";

function Header() {
  const navigate = useNavigate();
  const cartItems: CartItem[] = useSelector(selectCart);
  const categories = [
    { id: "cafe_viet", name: "Cafe Việt" },
    { id: "cafe_may", name: "Cafe Máy" },
    { id: "cafe_da_xay", name: "Cafe Đá Xay" },
    { id: "tra", name: "Trà" },
    { id: "special_drinks", name: "Special Drinks" },
    { id: "nuoc_ep", name: "Nước ép - Sinh tố" },
    { id: "tra_sua", name: "Trà Sữa" },
    { id: "nuoc_ngot", name: "Nước Ngọt - Giải Khát" },
  ];

  const scrollToProducts = () => {
    const productsSection = document.getElementById("products-section");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const goToCheckout = () => {
    navigate("/checkout");
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo" onClick={() => navigate("/")}>
          <h2>☕ Cafe-Shop</h2>
        </div>

        <nav className="navigation">
          <ul className="nav-list">
            {categories.map((category, index) => (
              <li key={index} className="nav-item">
                <button onClick={scrollToProducts} className="nav-link">
                  {category.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="cart-section">
          <button className="cart-button" onClick={goToCheckout}>
            <ShoppingCartIcon className="cart-icon" />
            <span className="cart-count">{cartItems.length}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;

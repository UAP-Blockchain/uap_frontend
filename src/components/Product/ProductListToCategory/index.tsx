import { useEffect, useState } from "react";
import ProductCard from "../ProductCard";
import type { Product } from "../../../models/Product";
import { getProducts } from "../../../services/customer/home/api";
import "./ProductListToCategory.scss";

interface ProductListToCategoryProps {
  category?: string;
  onAddToCart?: (product: Product) => void;
  title?: string;
  showTitle?: boolean;
}

function ProductListToCategory({
  category,
  onAddToCart,
  title,
  showTitle = true,
}: ProductListToCategoryProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (category === "isBestSeller") {
      const filtered = products.filter(
        (product) => product.isBestSeller === true
      );
      setFilteredProducts(filtered);
    } else if (category) {
      const filtered = products.filter(
        (product) => product.categoryId === category
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [products, category]);

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return "Tất cả sản phẩm";

    const categoryMap: { [key: string]: string } = {
      1: "Cafe Việt",
      2: "Cafe Máy",
      3: "Cafe Đá Xay",
      4: "Trà",
      5: "Special Drinks",
      6: "Nước ép - Sinh tố",
      7: "Trà Sữa",
      8: "Nước Ngọt - Giải Khát",
    };
    return categoryMap[categoryId] || categoryId;
  };

  const handleAddToCart = (product: Product) => {
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      console.log("Thêm vào giỏ hàng:", product);
    }
  };

  if (loading) {
    return (
      <div className="product-list-category">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-list-category">
      {showTitle && (
        <div className="category-header" data-aos="fade-up">
          <h2>{title || getCategoryName(category)}</h2>
          <p>
            {filteredProducts.length > 0
              ? `${filteredProducts.length} sản phẩm được tìm thấy`
              : "Không có sản phẩm nào trong danh mục này"}
          </p>
        </div>
      )}

      {filteredProducts.length > 0 ? (
        <div className="products-grid">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <ProductCard product={product} onAddToCart={handleAddToCart} />
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state" data-aos="fade-up">
          <div className="empty-icon">📦</div>
          <h3>Không có sản phẩm</h3>
          <p>Danh mục này hiện chưa có sản phẩm nào.</p>
        </div>
      )}
    </div>
  );
}

export default ProductListToCategory;

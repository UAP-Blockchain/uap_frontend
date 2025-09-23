import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import CTable from "../../../components/Ctable";
import type { Product } from "../../../models/Product";
import { getProductsMain } from "../../../services/customer/home/api";

function ManagerProduct() {
  const [data, setData] = useState<Product[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const defaultPageSize = 10;
  const [loading, setLoading] = useState(false);
  const productColumns: ColumnsType<Product> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Category",
      dataIndex: "categoryName",
      key: "categoryName",
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (image: string) => (
        <img src={image} alt="Product" style={{ width: 50, height: 50 }} />
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price: number) => `${price.toLocaleString()} VND`,
    },
    {
      title: "Discount (%)",
      dataIndex: "discountPercent",
      key: "discountPercent",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
    },
    {
      title: "Reviews",
      dataIndex: "reviews",
      key: "reviews",
    },
    {
      title: "Best Seller",
      dataIndex: "isBestSeller",
      key: "isBestSeller",
      render: (isBestSeller: boolean) => (isBestSeller ? "Yes" : "No"),
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (isActive ? "Yes" : "No"),
    },
  ];
  const fetchProducts = async (limit: number, offset: number) => {
    try {
      setLoading(true);
      const response = await getProductsMain(limit, offset);
      setData(response.data.data);
      setTotalItems(response.data.count);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(defaultPageSize, 0);
  }, []);

  const handleChangePage = (page: number, pageSize: number) => {
    console.log(page, pageSize);
    const offset = (page - 1) * pageSize;
    fetchProducts(pageSize, offset);
  };
  return (
    <div>
      <CTable
        loading={loading}
        columns={productColumns}
        dataSource={data}
        isPagination
        defaultPageSize={defaultPageSize}
        totalItems={totalItems}
        onPageChange={handleChangePage}
      />
    </div>
  );
}

export default ManagerProduct;


import productImage from "@/public/product-image.png";
import Image from "next/image";
const ProductShowcase = () => {
  return (
   <section className="py-24 overflow-x-clip">
    <div className="container">
      <div className="section-heading">
      <div className="flex justify-center">
        <div className="tag">Booster your productivity</div>
        </div>
        <h2 className="section-title mt-5">A more effective way to track progress</h2>

        <p className="section-description mt-5">Isso cobre os fundamentos básicos. A partir daqui, você pode adicionar funcionalidades como autenticação, gerenciamento de usuários, estilização do frontend, etc. Precisa de ajuda com alguma dessas etapas</p>
      </div>

        <Image  src={productImage} alt="Product Image"  className="mt-10" />
    </div>
   </section>
  );
};

export default ProductShowcase;

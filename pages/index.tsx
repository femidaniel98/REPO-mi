import HomeActions from "@/components/partials/home/HomeActions";
import PageIntro from "@/components/partials/home/PageIntro";
import ProductsFeatured from "@/components/partials/home/ProductsFeatured";
import WhyChooseUs from "@/components/partials/home/WhyChooseUs";
import DefaultLayout from "@/layouts/DefaultLayout";
import { server } from "@/utils/server";

const IndexPage = () => {
  return (
    <DefaultLayout>
      <PageIntro />

      <HomeActions />

      <WhyChooseUs />

      <ProductsFeatured />
    </DefaultLayout>
  );
};

export default IndexPage;

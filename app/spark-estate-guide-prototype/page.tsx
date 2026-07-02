import { redirect } from "next/navigation";
import { SPARK_ESTATE_GUIDE_DEFAULT_ROUTE } from "@/lib/estate/sparkEstateGuide";

export default function SparkEstateGuidePrototypePage() {
  redirect(SPARK_ESTATE_GUIDE_DEFAULT_ROUTE);
}

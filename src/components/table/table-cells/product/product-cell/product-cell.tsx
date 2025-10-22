import type { HttpTypes } from "@medusajs/types";

import { useTranslation } from "react-i18next";

import { Thumbnail } from "@components/common/thumbnail";

import isB2B from "@lib/is-b2b";

type ProductCellProps = {
  product: Pick<HttpTypes.AdminProduct, "thumbnail" | "title">;
};

export const ProductCell = ({ product }: ProductCellProps) => {
  return (
    <div className="flex h-full w-full max-w-[250px] items-center gap-x-3 overflow-hidden">
      <div className="w-fit flex-shrink-0">
        <Thumbnail src={product.thumbnail} />
      </div>
      <span title={product.title} className="truncate">
        {product.title}
      </span>
    </div>
  );
};

export const ProductHeader = () => {
  const { t } = useTranslation();

  const isB2BPanel = isB2B();

  return (
    <div className="flex h-full w-full items-center">
      <span>{isB2BPanel ? t("fields.offer") : t("fields.product")}</span>
    </div>
  );
};

import { HttpTypes } from '@medusajs/types';
import { Container, Heading } from '@medusajs/ui';

type ProductTagGeneralSectionProps = {
  productTag: HttpTypes.AdminProductTag;
};

export const ProductTagGeneralSection = ({ productTag }: ProductTagGeneralSectionProps) => {
  return (
    <Container className="flex items-center justify-between">
      <div className="flex items-center gap-x-1.5">
        <span className="h1-core text-ui-fg-muted">#</span>
        <Heading>{productTag.value}</Heading>
      </div>
    </Container>
  );
};

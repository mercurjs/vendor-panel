import { Check } from '@medusajs/icons';
import { Button, clx, Heading } from '@medusajs/ui';
import { Link } from 'react-router-dom';

export const OnboardingRow = ({
  label,
  state,
  link,
  buttonLabel
}: {
  label: string;
  state: boolean;
  link: string;
  buttonLabel: string;
}) => {
  return (
    <div className="flex justify-between py-2">
      <div className="flex items-center gap-3">
        <div
          className={clx('flex h-6 w-6 items-center justify-center rounded-full border', {
            'border-dashed': !state,
            'border-current': state
          })}
        >
          {state && <Check />}
        </div>
        <Heading className="text-sm">{label}</Heading>
      </div>
      <Link to={link}>
        <Button className="min-w-20">{buttonLabel}</Button>
      </Link>
    </div>
  );
};

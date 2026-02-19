import { CurrencyDollar, XMarkMini } from '@medusajs/icons';
import { Button, Kbd, Prompt, Text } from '@medusajs/ui';

export const MercurConnectModal = ({
  open,
  onOpenChange,
  testId = 'mercur-connect-modal'
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testId?: string;
}) => {
  return (
    <Prompt
      open={open}
      onOpenChange={onOpenChange}
      data-testid={`${testId}-modal`}
    >
      <Prompt.Content
        className="w-full max-w-[560px] px-6 py-4"
        data-testid={`${testId}-content`}
      >
        <Prompt.Header
          className="flex items-end justify-end p-0"
          data-testid={`${testId}-header`}
        >
          <div className="flex items-center gap-2">
            <Kbd data-testid={`${testId}-close-kbd`}>esc</Kbd>
            <Button
              variant="transparent"
              size="small"
              data-testid={`${testId}-close-button`}
              className="flex items-center gap-4 p-1 hover:bg-transparent"
              onClick={() => onOpenChange(false)}
            >
              <XMarkMini data-testid={`${testId}-close-icon`} />
            </Button>
          </div>
        </Prompt.Header>
        <Prompt.Description
          data-testid={`${testId}-description-wrapper`}
          className="mx-auto my-10 flex w-full max-w-[464px] flex-col items-center gap-2 text-center"
        >
          <CurrencyDollar />
          <Text
            size="small"
            weight="plus"
            className="line-height-[20px] text-ui-fg-base"
            data-testid={`${testId}-title`}
          >
            Mercur Connect Feature
          </Text>
          <Text
            size="small"
            className="text-ui-fg-subtle"
            data-testid={`${testId}-description`}
          >
            Your current plan doesn’t include this feature.
            <span className="block">Please contact your admin to enable it for your account.</span>
          </Text>
        </Prompt.Description>
      </Prompt.Content>
    </Prompt>
  );
};

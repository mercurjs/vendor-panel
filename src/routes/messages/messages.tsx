import { Container, Heading, Text } from '@medusajs/ui';
import { Inbox } from '@talkjs/react';

export const Messages = () => {
  return (
    <Container className="min-h-[700px] divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>Messages</Heading>
        </div>
      </div>

      <div className="h-[655px] px-6 py-4">
        {__TALK_JS_APP_ID__ ? (
          <Inbox className="h-full" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center">
            <Heading>No TalkJS App ID</Heading>
            <Text
              className="mt-4 text-ui-fg-subtle"
              size="small"
            >
              Connect TalkJS to manage your messages
            </Text>
          </div>
        )}
      </div>
    </Container>
  );
};

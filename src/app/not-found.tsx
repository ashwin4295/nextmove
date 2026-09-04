import { Button, Container, Wordmark } from "@/lib/ui";

export default function NotFound() {
  return (
    <main className="min-h-full bg-canvas pb-16">
      <Container className="max-w-[720px] py-8">
        <Wordmark />
        <h1 className="mt-10">That link doesn&apos;t go anywhere.</h1>
        <p className="mt-5 max-w-[46ch] leading-relaxed">
          The page may have been mistyped, or the conversation was never
          finished.
        </p>
        <div className="mt-8">
          <Button href="/">Start a conversation</Button>
        </div>
      </Container>
    </main>
  );
}

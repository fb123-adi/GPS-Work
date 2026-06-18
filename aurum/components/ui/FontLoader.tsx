// Injects critical font preload tags into <head> via Next.js metadata API.
// Keeping this as a server component means zero JS sent to the client.
export default function FontLoader() {
  return (
    <>
      <link
        rel="preload"
        as="style"
        href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,700;0,6..96,900;1,6..96,400;1,6..96,700&family=Jost:wght@300;400;500;600&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,700;0,6..96,900;1,6..96,400;1,6..96,700&family=Jost:wght@300;400;500;600&display=swap"
      />
    </>
  );
}

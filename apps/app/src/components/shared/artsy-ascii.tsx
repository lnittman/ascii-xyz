export const ARTSY_ASCII = `
  _                 
 | | ___   __ _ ___ 
 | |/ _ \\ / _\` / __|
 | | (_) | (_| \\__ \\
 |_|\\___/ \\__, |___/
          |___/     
`;

export function ArtsyAscii() {
  return (
    <pre className="text-xs font-mono text-muted-foreground">
{ARTSY_ASCII}
    </pre>
  );
}

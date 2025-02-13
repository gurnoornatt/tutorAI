declare namespace JSX {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // Add directory upload attributes
    directory?: string;
    webkitdirectory?: string;
  }
} 
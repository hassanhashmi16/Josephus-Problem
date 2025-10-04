import "./globals.css";

export const metadata = {
  title: "Josephus Problem Visualizer",
  description: "Made by me :p",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

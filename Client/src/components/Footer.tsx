function Footer() {
  return (
    <footer className="footer sm:footer-horizontal footer-center bg-base-300 text-base-content p-4">
      <aside>
        <p>&copy; {new Date().getFullYear()} Comit. All rights reserved.</p>
      </aside>
    </footer>
  );
}

export default Footer;
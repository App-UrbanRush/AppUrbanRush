import "./Footer.css";

const Footer = () => {
  return (
    <footer style={{ background: '#fff', borderTop: '1px solid #f0f0f0', padding: '16px 0', marginTop: '8px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 16px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#999' }}>
        <span>&copy; {new Date().getFullYear()} AppUrbanRush. Todos los derechos reservados.</span>
        <div style={{ display: 'flex', gap: '16px' }}>
          <a href="/privacidad" style={{ color: '#999', textDecoration: 'none' }}>Política de Privacidad</a>
          <a href="/terminos" style={{ color: '#999', textDecoration: 'none' }}>Términos de Servicio</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

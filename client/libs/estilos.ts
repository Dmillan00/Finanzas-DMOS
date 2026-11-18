// DialogContent de los formularios cortos (cuentas y categorías):
// en móvil, panel pegado abajo que ocupa lo que mida el formulario;
// desde lg, centrado como el Dialog normal de shadcn.
export const PANEL_MOVIL =
  'top-auto bottom-0 left-0 max-w-none translate-x-0 translate-y-0 rounded-b-none rounded-t-2xl pb-8 sm:max-w-none ' +
  'lg:top-1/2 lg:bottom-auto lg:left-1/2 lg:max-w-sm lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-xl lg:pb-6';

// DialogContent del formulario de movimiento (3 pasos): mismo panel de abajo
// que PANEL_MOVIL, con tope de alto por si se abre el calendario; desde lg,
// centrado y más ancho (el formulario de PC va en 3 columnas).
export const PANEL_MOVIL_ANCHO =
  'top-auto bottom-0 left-0 max-h-[85dvh] max-w-none overflow-y-auto translate-x-0 translate-y-0 rounded-b-none rounded-t-2xl pb-8 sm:max-w-none ' +
  'lg:top-1/2 lg:bottom-auto lg:left-1/2 lg:max-h-none lg:max-w-2xl lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-xl lg:pb-6';

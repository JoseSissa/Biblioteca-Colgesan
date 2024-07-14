const bodyContentRegex = /<body[^>]*>((.|[\n\r])*)<\/body>/im;

const checkNavigationSupported = () => Boolean(document.startViewTransition());

const fetchNuevaPagina = async (url) => {
    // Se desea cargar la página destino
    // Se usa un fetch para solicitar el HTML de esa página dsestino
    const response = await fetch(url); // /url-destino
    const text = await response.text();
    // Nos queremos quedar sólo con el HTML dentro de la etiqueta <body>
    // Se usará una regex para extraerlo, y el match nos devuelve la info que necesitamos en la segunda posición
    const [, dataBody] = text.match(bodyContentRegex);
    return dataBody;
};

export function ejecutarTransicion() {
    if (!checkNavigationSupported()) return;

    window.navigation.addEventListener("navigate", (eventoNavegacion) => {
        // De esta forma sabemos la url destino de la navegación
        const urlDestino = new URL(eventoNavegacion.destination.url);

        // Verificamos si la navegación es a una página externa (Diferente dominio) lo ignoramos
        if (window.location.origin !== urlDestino.origin) return;

        // Si la navegación es en el mismo dominio (Origen) la interceptamos
        eventoNavegacion.intercept({
            async handler() {
                const dataBody = await fetchNuevaPagina(urlDestino.pathname);

                // Usamos la api de viewTransition
                document.startViewTransition(() => {
                    // ]Scroll al inicio
                    document.body.innerHTML = dataBody;
                    document.documentElement.scrollTop = 0;
                });
            },
        });
    });
}

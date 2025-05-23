export const renderer = {
    $: (selector) => document.getElementById(selector),

    clampElmToParent(motherElm, element) {
        const { scrollX, scrollY } = window;
        const rect = motherElm.getBoundingClientRect();
        const pRect = element.getBoundingClientRect();

        let left = rect.right + scrollX + 15;
        let top = rect.top + scrollY;

        if (left + pRect.width > document.body.scrollWidth + scrollX) {
            left = rect.left - pRect.width + scrollX - 15;
        }
        if (top + pRect.height > document.body.scrollHeight + scrollY) {
            top = rect.bottom - pRect.height + scrollY;
        }

        element.style.left = `${Math.max(scrollX, left)}px`;
        element.style.top = `${Math.max(scrollY, top)}px`;
        return element;
    },

    registerCtxMenuHandler(motherElm, creationData = []) {
        const ctxMenuBackdrop = document.createElement("div");
        ctxMenuBackdrop.className = "context-menu-backdrop";

        function createMenu(items, level = 0) {
            const menu = document.createElement("div");
            menu.className = "context-menu";
            menu.style.zIndex = 10000 + level;

            for (const item of items) {
                const el = document.createElement("div");
                el.className = "context-menu-item";
                el.textContent = item.label ?? "";

                if (item.type === "label") {
                    el.classList.add("disabled");
                } else if (item.type === "action") {
                    el.addEventListener("click", (e) => {
                        e.stopPropagation();
                        hideMenu();
                        item.action?.();
                    });
                } else if (item.type === "link") {
                    el.addEventListener("click", (e) => {
                        e.stopPropagation();
                        hideMenu();
                        window.open(item.url, "_blank");
                    });
                } else if (item.type === "submenu") {
                    el.classList.add("has-submenu");
                    const submenu = createMenu(item.children || [], level + 1);
                    el.appendChild(submenu);

                    el.addEventListener("mouseenter", () => {
                        renderer.clampElmToParent(el, submenu);
                        submenu.style.display = "block";
                    });

                    el.addEventListener("mouseleave", () => {
                        submenu.style.display = "none";
                    });
                }

                menu.appendChild(el);
            }

            return menu;
        }

        const ctxMenu = createMenu(
            [
                {
                    label: "Reload",
                    type: "action",
                    action: window.location.reload,
                },
                ...creationData,
            ],
            0
        );

        const showMenu = () => {
            document.body.append(ctxMenuBackdrop, ctxMenu);
            renderer.clampElmToParent(motherElm, ctxMenu)
        };

        const hideMenu = () => {
            ctxMenu.remove();
            ctxMenuBackdrop.remove();
        };

        motherElm.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            showMenu(e.pageX, e.pageY);
        });

        document.addEventListener("click", (e) => {
            if (!ctxMenu.contains(e.target)) {
                hideMenu();
            }
        });

        ctxMenuBackdrop.addEventListener("click", () => {
            hideMenu();
        });

        window.addEventListener("scroll", hideMenu);
        window.addEventListener("resize", hideMenu);
        window.addEventListener("mouseleave", hideMenu);
        window.addEventListener("blur", hideMenu);
    },
};

export default renderer.$;
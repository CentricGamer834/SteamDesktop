export const renderer = {
    $: (selector) => document.getElementById(selector),

    clampElmToParent(motherElm, elementToClamp) {
        const { scrollX, scrollY } = window;
        const rect = motherElm.getBoundingClientRect();
        const pRect = elementToClamp.getBoundingClientRect();

        let left = rect.right + scrollX + 15;
        let top = rect.top + scrollY;

        if (left + pRect.width > document.body.scrollWidth + scrollX) {
            left = rect.left - pRect.width + scrollX - 15;
        }
        if (top + pRect.height > document.body.scrollHeight + scrollY) {
            top = rect.bottom - pRect.height + scrollY;
        }

        elementToClamp.style.left = `${Math.max(scrollX, left)}px`;
        elementToClamp.style.top = `${Math.max(scrollY, top)}px`;
        return elementToClamp;
    },

    /**
     * Creates a context menu for an element
     * @param {HTMLElement} motherElm
     * @param {Array<{
     * items: {
     *     type: "label" | "link" | "submenu",
     *     url: "https://example.com" | undefined,
     *     action: typeof Function | undefined
     * }
     * }>} menuOptions
     */
    registerCtxMenuHandler(motherElm, menuOptions) {
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
                ...menuOptions,
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

        return {
            showMenu,
            hideMenu,
            motherElm,
            menuOptions
        }
    },

    /**
     * Creates and renders a fully customizable modal dialog UI, appending it to a specified parent element.
     * Each item in the modal can represent a form control (select, checkbox, input, etc.) with event handlers,
     * attributes, labels, and layout options.
     *
     * @param {HTMLElement} motherElm - The DOM element to which the modal will be mounted.
     * @param {{
     *   attributes?: { [key: string]: string }, // Attributes to apply to the modal container (e.g., id, data-* props)
     *   items: Array<{
     *     id: string, // Unique DOM ID for the input or section
     *     type: "select" | "divider" | "checkbox" | "loginDetails" | "text" | string, // Component type
     *     textContent?: string, // Optional display text (label, divider text, button content)
     *     value?: any, // Initial/default value for the input element
     *     options?: Array<{ label: string, value: string }>, // Required for select input types
     *     hasLabel?: boolean, // Whether to render a <label> element (default: true)
     *     createGroupElement?: boolean, // Wraps the element inside a container div (default: true)
     *     attributes?: { [key: string]: string }, // Extra attributes for the input (e.g., placeholder)
     *     onEvent?: {
     *       event: string, // Event type (e.g., "click", "input", "change")
     *       handler: (e: Event) => void, // Event callback
     *       handlerOptions?: AddEventListenerOptions | boolean // Optional event listener options
     *     }
     *   }>
     * }} modalOptions - Configuration object defining the modal's appearance and behavior.
     *
     * @returns {{
     *   showMenu: () => void, // Function to display the modal
     *   hideMenu: () => void, // Function to hide and remove the modal
     *   motherElm: HTMLElement, // The parent DOM element that holds the modal
     *   menuOptions: typeof modalOptions.items // The original list of modal items for reference
     * }}
     */
    createSimpleModal(motherElm, creationData = {
        modalTitle: "Alert",
        elements: [
        ]
    }) {
        const { modalTitle } = creationData;

        //
        const modal = document.createElement("div");
        modal.className = "modal";
        // >
        const modalBackdrop = document.createElement("div");
        modalBackdrop.className = "modal-backdrop";
        // >
        const modalContent = document.createElement("div");
        modalContent.className = "modal-content";
        // >>
        const modalHeader = document.createElement("div");
        modalHeader.className = "modal-header";
        modalHeader.innerHTML = `<h2>${modalTitle}</h2><a class="modal-close">&times;</a>`;
        // >>
        const modalBody = document.createElement("div");
        modalBody.className = "modal-body";
        // >>
        const modalFooter = document.createElement("div");
        modalFooter.className = "modal-footer";


        modalContent.append(modalHeader, modalBody, modalFooter);
        modal.append(modalBackdrop, modalContent);


        return {
            isHidden: false,
            element: modal,
            show() {
                if (!isHidden) return;
                modal.style.cssText = "visibility:visible;opacity:1";
                motherElm.appendChild(modal);
                isHidden = false;
            },
            hide() {
                if (isHidden) return;
                modal.style.cssText = "visibility:hidden;opacity:0";
                modal.remove();
                isHidden = true;
            }
        }
    }
}
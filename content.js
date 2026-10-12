
(() => {
  const MIN_OPTIONS = 3;
  const installed = new WeakSet();

  function enhanceDropdown(select) {
    if (
      installed.has(select) ||
      select.multiple ||
      select.disabled ||
      select.options.length < MIN_OPTIONS
    ) {
      return;
    }

    installed.add(select);

    const wrapper = document.createElement("div");
    wrapper.className = "exam-search-wrapper";

    const search = document.createElement("input");
    search.type = "search";
    search.className = "exam-search-input";
    search.placeholder = "Search options...";
    search.autocomplete = "off";
    search.setAttribute("aria-label", "Search dropdown options");

    const results = document.createElement("div");
    results.className = "exam-search-results";
    results.hidden = true;
    results.setAttribute("role", "listbox");

    wrapper.append(search, results);
    select.parentNode.insertBefore(wrapper, select);

    function renderResults() {
      results.replaceChildren();

      const query = search.value.trim().toLocaleLowerCase();
      let count = 0;

      for (const option of select.options) {
        if (option.disabled || option.value === "") continue;

        const label = option.textContent.trim();

        if (!label.toLocaleLowerCase().includes(query)) continue;

        const button = document.createElement("button");
        button.type = "button";
        button.className = "exam-search-option";
        button.textContent = label;

        button.addEventListener("click", () => {
          select.value = option.value;

          select.dispatchEvent(
            new Event("input", { bubbles: true })
          );
          select.dispatchEvent(
            new Event("change", { bubbles: true })
          );

          search.value = label;
          results.hidden = true;
        });

        results.append(button);
        count++;

      }

      if (count === 0) {
        const empty = document.createElement("p");
        empty.className = "exam-search-empty";
        empty.textContent = "No matching options found.";
        results.append(empty);
      }

      results.hidden = false;
    }

    search.addEventListener("input", renderResults);

    search.addEventListener("focus", renderResults);

    document.addEventListener("click", (event) => {
      if (!wrapper.contains(event.target)) {
        results.hidden = true;
      }
    });

    select.addEventListener("change", () => {
      const selected = select.selectedOptions[0];
      if (selected && !search.matches(":focus")) {
        search.value = selected.textContent.trim();
      }
    });

    const selected = select.selectedOptions[0];
    if (selected && selected.value !== "") {
      search.placeholder = `Selected: ${selected.textContent.trim()}`;
    }
  }

  let noDropdownMessageShown = false;

  function scan() {
    const dropdowns = document.querySelectorAll("select");

    if (dropdowns.length === 0) {
      if (noDropdownMessageShown) return;

      noDropdownMessageShown = true;

      const message = document.createElement("div");
      message.id = "duformfix-no-dropdown";
      message.textContent = "No drop down found";

      Object.assign(message.style, {
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: "2147483647",
        background: "#fff3cd",
        color: "#111",
        padding: "12px 18px",
        border: "1px solid #ffecb5",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
      });

      document.body.appendChild(message);

      setTimeout(() => {
        document.getElementById("duformfix-no-dropdown")?.remove();
      }, 10000);

      return;
    }

    document.getElementById("duformfix-no-dropdown")?.remove();
    dropdowns.forEach(enhanceDropdown);
  }

  scan();

  // Some examination forms load fields dynamically.
  const observer = new MutationObserver(scan);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();

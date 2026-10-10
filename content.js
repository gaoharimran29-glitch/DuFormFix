
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

  function scan() {
    document.querySelectorAll("select").forEach(enhanceDropdown);
  }

  scan();

  // Some examination forms load fields dynamically.
  const observer = new MutationObserver(scan);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();

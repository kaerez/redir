# Client-Side URL Shortener (GitHub Pages)

A serverless, zero-maintenance URL shortener and redirect engine that runs entirely on GitHub Pages. It uses a smart `404.html` "hack" to route traffic based on a TOML configuration file.

## 🚀 Features

* **Zero Backend:** Runs 100% on GitHub's CDN (Fastly). No database, no servers.
* **Multi-Domain Support:** Manage links for `bit.ly`, `example.com`, and `my-personal.site` in a single repo.
* **Advanced Routing:** Supports nested paths (e.g., `/marketing/2024/campaign`).
* **Conflict Resolution:** Robust hierarchy (Strict Mode > Key Priority > Domain Priority > Defaults).
* **Dynamic Templating:** Pass URL segments and query parameters into destination URLs (e.g., for tracking pixels or dynamic redirects).
* **Security:** Built-in sanitization, recursive decoding protection, and input length limits.

---

## 🛠️ Installation

1.  **Create Repository:** Create a new Public (Free) or Private (Pro) GitHub repository.
2.  **Add Files:**
    * `404.html`: The core engine (provided in project).
    * `config.toml`: Your redirect database.
3.  **Enable GitHub Pages:**
    * Go to **Settings** > **Pages**.
    * Source: `Deploy from a branch`.
    * Branch: `main` / `root`.
4.  **Wait:** It takes about 60 seconds for the site to go live.

---

## 🪏 Getting Other Domains To Work

Since GH Pages limits to one domain, you can use [worker.js](worker.js) to get other domains to work as well.  
1. Set up a Cloudflare Worker.
2. Use the provided script.
3. Configure an environmental variable 'TARGET_HOSTNAME' to your primary domain used with GH Pages, E.g. 'secw.net' in our case.
4. Route the other domains to the worker.

FYI: You can also configure specific overrides, for example to have 'example.com' use another GH Pages at 'example.org'  
     just add an environmental variable 'example.com' with a value of 'example.org'.

---

## ⚙️ Configuration (`config.toml`)

The system relies on a `config.toml` file (see [config.toml.example](config.toml.example)).

### Basic Structure

```toml
[default]
method = 302
404 = "https://google.com"

# Simple Redirects (Global)
meet.value = "https://meet.google.com/abc-123"

[[domains]]
host = "links.example.com"
blog.value = "https://example.com/blog"
```

### Hierarchy & Logic
When a user visits a URL, the engine resolves conflicts in this order:

1.  **Strict Mode:** If a domain has `strict = true`, all global defaults are ignored (except for 404/method fallbacks).
2.  **Explicit Link Priority:** If the specific link key has `key.priority = true`, the **Domain Link Wins**.
3.  **Domain Priority:** If the `[domain]` has `priority = true`, the **Domain Link Wins**.
4.  **Global Delegation:** If `[default]` has `priority = true`, it grants priority to domains. **Domain Link Wins**.
5.  **Centralized Control (Fallback):** If none of the above are true (default is `false` or missing), the **Default Link Wins**.

---

## 🧩 Templating System

You can inject parts of the incoming URL into the destination URL using Handlebars-style syntax `{{tag}}`. All outputs are strictly URL-encoded.

| Tag | Description | Example Input | Example Output |
| :--- | :--- | :--- | :--- |
| `{{key}}` | Full path + query | `/a/b?q=1` | `a/b?q=1` |
| `{{rawkey}}` | Full FQDN | `https://site.com/a` | `https://site.com/a` |
| `{{keyN}}` | Path segment at index N | `/users/john` -> `{{key1}}` | `john` |
| `{{keyN.param}}` | Query param value | `?id=50` -> `{{key0.id}}` | `50` |
| `{{keyN.paramI}}` | I-th value of a param | `?tag=a&tag=b` -> `{{key0.tag1}}` | `b` |

---

## 🛡️ Security

* **Recursion Limit:** Decodes malicious `%2525` chains max 5 times.
* **Input Cap:** Rejects URLs longer than 2048 chars.
* **Normalization:** Enforces UTF-8 NFC and lowercasing for consistent matching.
* **Sanitization:** All template injections are `encodeURIComponent` safe.


## 📝 License

This project is dual-licensed under the **GNU Affero General Public License v3.0 (AGPLv3)** and a **Commercial License**. See [LICENSE](LICENSE).

### Option 1: Open Source (AGPLv3)
For open-source projects, you may use this software under the terms of the AGPLv3. 
Note that this license requires you to share your source code if you distribute 
this software or host it over a network.

### Option 2: Commercial License
If you wish to use this software in a proprietary product or do not want to 
be bound by the copyleft requirements of the AGPLv3, you must purchase a 
Commercial License.

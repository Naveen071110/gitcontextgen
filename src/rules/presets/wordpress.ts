import { WordPressDetection } from '../../analyzer/detector';

export interface WordPressRuleContext {
  name?: string;
  type?: 'core' | 'plugin' | 'theme' | 'block' | 'unknown';
  version?: string;
  textDomain?: string;
  hasWpCli?: boolean;
  hasTelex?: boolean;
  hasBlockJson?: boolean;
}

/**
 * Cursor Rules (.mdc) Header and Directives
 */
export const WORDPRESS_CURSOR_FRONTMATTER = `---
description: Enforces secure, performant, and standards-compliant WordPress development (WPCS)
globs: ["**/*.php", "src/blocks/**/*.js", "block.json"]
alwaysApply: true
---`;

/**
 * Generates standards-compliant Cursor (.mdc) rules for WordPress
 */
export function getWordPressCursorRules(context?: WordPressRuleContext): string {
  const targetName = context?.name || 'WordPress Project';
  const prefix = context?.textDomain ? context.textDomain.replace(/[^a-zA-Z0-9_]/g, '_') : 'wp_project';

  return `${WORDPRESS_CURSOR_FRONTMATTER}

# .cursor/rules/wordpress.mdc — ${targetName} WordPress Standards & Security Guardrails

> **Standards**: WordPress Coding Standards (WPCS) & VIP Security Guidelines
> **Single Source of Truth**: Synchronized with [CLAUDE.md](CLAUDE.md)
> **Enforcement**: Active across all PHP source files, Gutenberg blocks, and block schemas (\`alwaysApply: true\`).

You are an expert WordPress Core, Plugin, and Theme developer working on ${targetName}. Adhere strictly to the following security constraints and architectural guidelines:

---

## 1. 🛡️ Security Guardrails (Sanitization, Escaping, Nonces & DB)

### A. Data Sanitization (Untrusted Inputs)
Never trust user or client input. Sanitize every incoming parameter:
- **Text / Strings**: Use \`sanitize_text_field( $val )\`.
- **Numbers / Integers**: Use \`absint( $val )\` or \`intval( $val )\`.
- **Slugs / Keys**: Use \`sanitize_key( $val )\` or \`sanitize_title( $val )\`.
- **Emails**: Use \`sanitize_email( $val )\`.
- **Textareas**: Use \`sanitize_textarea_field( $val )\`.
- **Array of Strings**: Map via \`array_map( 'sanitize_text_field', $arr )\`.
- **Superglobals**: Always unslash before sanitizing: \`sanitize_text_field( wp_unslash( $_POST['field'] ?? '' ) )\`.
- **PHP Input**: Prefer \`filter_input( INPUT_POST, 'key', FILTER_SANITIZE_SPECIAL_CHARS )\`.

### B. Output Escaping (Late Escaping Rule)
Escape output at the exact moment of rendering in HTML:
- **General HTML text**: \`<?php echo esc_html( $text ); ?>\`
- **HTML attributes**: \`<input value="<?php echo esc_attr( $val ); ?>" />\`
- **URLs / Hrefs**: \`<a href="<?php echo esc_url( $url ); ?>">\`
- **Textareas / Preformatted**: \`<textarea><?php echo esc_textarea( $body ); ?></textarea>\`
- **JavaScript / JSON inside scripts**: \`<?php echo wp_json_encode( $data ); ?>\`
- **Localized strings**: Use localized escaping wrappers:
  - \`esc_html__( 'Text', '${context?.textDomain || 'text-domain'}' )\`
  - \`esc_html_e( 'Text', '${context?.textDomain || 'text-domain'}' )\`
  - \`esc_attr__( 'Label', '${context?.textDomain || 'text-domain'}' )\`
  - \`esc_attr_e( 'Label', '${context?.textDomain || 'text-domain'}' )\`

### C. CSRF & Nonce Verification
Every form submission, AJAX request, and REST API mutation MUST verify authorization and nonces:
- **Admin POST / Forms**:
  \`\`\`php
  check_admin_referer( '${prefix}_action', '${prefix}_nonce' );
  if ( ! current_user_can( 'manage_options' ) ) {
      wp_die( esc_html__( 'Unauthorized access.', '${context?.textDomain || 'text-domain'}' ) );
  }
  \`\`\`
- **AJAX Handlers**:
  \`\`\`php
  check_ajax_referer( '${prefix}_nonce_action', 'nonce' );
  if ( ! current_user_can( 'edit_posts' ) ) {
      wp_send_json_error( [ 'message' => esc_html__( 'Forbidden', '${context?.textDomain || 'text-domain'}' ) ], 403 );
  }
  \`\`\`
- **REST Endpoints**: Register explicit \`permission_callback\` in \`register_rest_route()\`.

### D. Direct Database Queries ($wpdb)
Never concatenate untrusted variables into SQL strings. Always utilize \`$wpdb->prepare()\`:
\`\`\`php
global $wpdb;
$safe_query = $wpdb->prepare(
    "SELECT * FROM {$wpdb->prefix}custom_table WHERE user_id = %d AND status = %s",
    absint( $user_id ),
    sanitize_text_field( $status )
);
$results = $wpdb->get_results( $safe_query );
\`\`\`

---

## 2. 📐 WordPress Coding Standards (WPCS)

- **Indentation**: Use real tabs for indentation, spaces only for mid-line alignment.
- **Yoda Conditions**: Always put the constant, literal, or function call on the left side of comparisons:
  - ✅ \`if ( true === $is_active )\`, \`if ( 10 === $count )\`, \`if ( null === $result )\`
  - ❌ \`if ( $is_active === true )\`, \`if ( $count === 10 )\`
- **Naming & Prefixing**:
  - Global functions: \`${prefix}_function_name()\`
  - Global constants: \`${prefix.toUpperCase()}_CONSTANT_NAME\`
  - Classes & Interfaces: \`${prefix.toUpperCase()}_Class_Name\` or namespace \`${prefix}\\SubPackage\`
  - Hook names: \`do_action( '${prefix}_before_render' )\`
  - Option names: \`get_option( '${prefix}_settings' )\`
- **PHP Modernity**: Declare strict types where supported; declare parameter & return type hints.

---

## 3. 🧩 Modern Block & Telex Integration (Gutenberg & WordPress Studio)

- **Block Schema**: Define block metadata in \`block.json\` conforming to schema \`https://schemas.wp.org/trunk/block.json\`.
- **Automattic Telex Integration**: When configuring experimental Telex blocks:
  - Register clean attributes with explicit types and defaults in \`block.json\`.
  - Maintain stateless block transforms and pure React rendering in \`edit.js\` and \`save.js\`.
- **WordPress Studio & Local Dev**:
  - Verify endpoints against local Studio workerd/sqlite or Docker environments.
  - Rely on \`@wordpress/scripts\` for compiling block bundles (\`npm run build\`).

---

## 4. ⚡ Standard wp-cli Execution Commands

\`\`\`bash
# Activate all plugins
wp plugin activate --all

# Object cache & transient flush
wp cache flush
wp transient delete --all

# Update local development site URL
wp option update siteurl "http://localhost:8888"
wp option update home "http://localhost:8888"

# Verify database health & core version
wp core version
wp db check
\`\`\`
`.trim();
}

/**
 * Generates CLAUDE.md guide for WordPress
 */
export function getWordPressClaudeRules(context?: WordPressRuleContext): string {
  const targetName = context?.name || 'WordPress Workspace';
  const prefix = context?.textDomain ? context.textDomain.replace(/[^a-zA-Z0-9_]/g, '_') : 'wp_project';

  return `# CLAUDE.md — ${targetName} AI Developer Guide

> **Ecosystem**: WordPress (WPCS, Gutenberg Blocks & wp-cli)
> **Rule Harmonization**: Paired with \`.cursor/rules/wordpress.mdc\` (\`alwaysApply: true\`)
> **Project Scope**: ${context?.type ? context.type.toUpperCase() : 'WORDPRESS WORKSPACE'}

---

## ⚡ Primary wp-cli & Development Commands

\`\`\`bash
# --- WordPress Lifecycle Commands (wp-cli) ---
wp plugin activate --all          # Activate all plugins in workspace
wp cache flush                     # Flush memory and Redis/Memcached object cache
wp transient delete --all          # Delete all expired transients
wp option update siteurl <url>     # Update local site URL (WordPress Studio/Local)
wp core version                    # Check active WordPress version
wp db check                        # Validate database schema integrity

# --- Gutenberg / Asset Compilation ---
npm run build                      # Compile block assets via @wordpress/scripts
npm run start                      # Fast watch mode for block JS/SCSS
\`\`\`

---

## 🛡️ WPCS & VIP Security Mandates

1. **Yoda Condition Rule**: Comparisons MUST place literal values on the left side:
   - \`if ( false === $response )\`, \`if ( 'publish' === $post->post_status )\`
2. **Tab Indentation**: Indent PHP files with tabs, not spaces.
3. **Input Sanitization**: Run all incoming superglobals (\`$_GET\`, \`$_POST\`, \`$_REQUEST\`) through \`wp_unslash()\` followed by \`sanitize_text_field()\`, \`absint()\`, or \`sanitize_key()\`.
4. **Late Escaping**: Always escape variables at the point of echo using \`esc_html()\`, \`esc_attr()\`, \`esc_url()\`, or \`esc_textarea()\`.
5. **Nonces & Permissions**: Protect every state-changing endpoint with \`check_admin_referer()\` or \`check_ajax_referer()\` and \`current_user_can()\`.
6. **Prepared Queries**: Strictly execute database queries via \`$wpdb->prepare( "SELECT ... WHERE id = %d", $id )\`.

---

## 🧱 Architecture & Telex Modern Block Blueprint
- **Block Configuration**: Defined via \`block.json\`.
- **Telex Compatibility**: Structure custom blocks to expose configurable hooks and attributes compatible with Automattic's experimental Telex block builder.
- **WordPress Studio**: Optimized for local development with zero telemetry and isolated SQLite/MySQL databases.
`.trim();
}

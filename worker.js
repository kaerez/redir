// Copyright (c) 2026 KSEC - Erez Kalman.
// This software is dual-licensed under the AGPLv3 and a commercial license.
// See the LICENSE file in the project root (https://www.github.com/kaerez/redir) for more information.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Domain-specific override, fallback to general target
    url.hostname = env[url.hostname] || env.TARGET_HOSTNAME;
    
    const response = await fetch(url.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    
    // Clone response and strip CF injection
    const newHeaders = new Headers(response.headers);
    newHeaders.delete('cf-edge-cache');
    newHeaders.delete('cf-cache-status');
    newHeaders.delete('cf-ray');
    newHeaders.set('x-robots-tag', 'noindex'); // optional
    
    return new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    });
  },
};

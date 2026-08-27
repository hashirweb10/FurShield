<?php
/**
 * Role-Based Access Control Middleware
 */

/**
 * Require a specific role. Exits with 403 if user doesn't have the role.
 * @param string|array $roles - single role or array of allowed roles
 */
function requireRole($roles) {
    $user = requireAuth();

    if (is_string($roles)) {
        $roles = [$roles];
    }

    if (!in_array($user['role'], $roles)) {
        respondForbidden('You do not have permission to access this resource');
    }

    return $user;
}

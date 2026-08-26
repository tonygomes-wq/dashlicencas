<?php
/**
 * PHP Compatibility Helpers
 * Funções para compatibilidade com versões antigas do PHP
 */

// str_ends_with() - Disponível apenas a partir do PHP 8.0
if (!function_exists('str_ends_with')) {
    function str_ends_with($haystack, $needle) {
        $length = strlen($needle);
        if ($length == 0) {
            return true;
        }
        return (substr($haystack, -$length) === $needle);
    }
}

// str_starts_with() - Disponível apenas a partir do PHP 8.0
if (!function_exists('str_starts_with')) {
    function str_starts_with($haystack, $needle) {
        $length = strlen($needle);
        return substr($haystack, 0, $length) === $needle;
    }
}

// str_contains() - Disponível apenas a partir do PHP 8.0
if (!function_exists('str_contains')) {
    function str_contains($haystack, $needle) {
        return $needle !== '' && strpos($haystack, $needle) !== false;
    }
}

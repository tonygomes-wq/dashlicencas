<?php
// api/OTPHelper.php - TOTP Utility for 2FA (No external dependencies)

class OTPHelper
{
    /**
     * Generates a 16-character base32 secret.
     */
    public static function generateSecret($length = 16)
    {
        $keys = array_merge(range('A', 'Z'), range(2, 7));
        $secret = '';
        for ($i = 0; $i < $length; $i++) {
            $secret .= $keys[array_rand($keys)];
        }
        return $secret;
    }

    /**
     * Generates a QR code URL for apps like Google Authenticator.
     * Uses Google Chart API (simple/no lib required).
     */
    public static function getQRCodeUrl($name, $secret, $issuer = 'MACIP-IP')
    {
        $name = urlencode($name);
        $issuer = urlencode($issuer);
        $otpauth = "otpauth://totp/$issuer:$name?secret=$secret&token=$issuer";
        return "https://api.qrserver.com/v1/create-qr-code/?data=" . urlencode($otpauth) . "&size=200x200&ecc=M";
    }

    /**
     * Verifies a TOTP code.
     */
    public static function verifyCode($secret, $code, $discrepancy = 1)
    {
        $currentTime = floor(time() / 30);

        for ($i = -$discrepancy; $i <= $discrepancy; $i++) {
            $checkTime = $currentTime + $i;
            if (self::calculateCode($secret, $checkTime) === $code) {
                return true;
            }
        }

        return false;
    }

    private static function calculateCode($secret, $time)
    {
        $secretKey = self::base32Decode($secret);

        // Time to 8 bytes binary
        $timeBin = pack('N*', 0) . pack('N*', $time);

        // HMAC-SHA1
        $hash = hash_hmac('sha1', $timeBin, $secretKey, true);

        // Dynamic Truncation
        $offset = ord($hash[19]) & 0xf;
        $otp = (
            (ord($hash[$offset + 0]) & 0x7f) << 24 |
            (ord($hash[$offset + 1]) & 0xff) << 16 |
            (ord($hash[$offset + 2]) & 0xff) << 8 |
            (ord($hash[$offset + 3]) & 0xff)
        ) % pow(10, 6);

        return str_pad($otp, 6, '0', STR_PAD_LEFT);
    }

    private static function base32Decode($secret)
    {
        if (empty($secret)) return '';

        $base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $base32charsFlipped = array_flip(str_split($base32chars));

        $secret = strtoupper($secret);
        $secret = str_replace('=', '', $secret);

        $binaryString = '';
        foreach (str_split($secret) as $char) {
            if (!isset($base32charsFlipped[$char])) continue;
            $binaryString .= str_pad(decbin($base32charsFlipped[$char]), 5, '0', STR_PAD_LEFT);
        }

        $binArr = str_split($binaryString, 8);
        $res = '';
        foreach ($binArr as $bin) {
            if (strlen($bin) < 8) continue;
            $res .= chr(bindec($bin));
        }

        return $res;
    }
}

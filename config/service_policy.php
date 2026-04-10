<?php

return [
    /*
     * Service policy: hide/block certain service types.
     *
     * Ported from legacy SMM-Panel/config/service_policy.php
     *
     * Goal: do not offer/accept harmful reaction products such as poop/tai reactions,
     * dislikes/downvotes, etc.
     */
    'patterns' => [
        // Poop / "tai" style reactions
        '/\x{1F4A9}/iu', // 💩
        '/\bpoop\b/iu',
        '/\btahi\b/iu',
        '/\btai\b/iu',

        // Thumbs down emoji
        '/\x{1F44E}/iu', // 👎
        '/\bthumbs\s*down\b/iu',

        // Dislikes / negative vote products
        '/\bdislike(s)?\b/iu',
        '/\bdownvote(s)?\b/iu',
        '/\bunlike(s|d)?\b/iu',

        // Vomit / sick reaction (🤮) - include Indonesian + common provider labels
        '/\b(muntah|vomit|vomiting|face\s*vomit(ing)?|facevomit(ing)?|puke|barf|throw\s*up|sick\s*face)\b/i',
        '/🤮/u',

        // Negative reactions (scope to "reaction(s)" to avoid over-blocking)
        '/\b(reaction|reactions)\b[^\n]{0,40}\bnegative\b/i',
        '/\bnegative\b[^\n]{0,40}\b(reaction|reactions)\b/i',
    ],
];

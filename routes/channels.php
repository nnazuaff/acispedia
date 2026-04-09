<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('orders.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

Broadcast::channel('dashboard.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

Broadcast::channel('deposits.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

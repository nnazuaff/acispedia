<?php

use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\DevicesController;
use App\Http\Controllers\Settings\SecurityController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/security', [SecurityController::class, 'edit'])->name('security.edit');

    Route::get('settings/devices', [DevicesController::class, 'edit'])->name('devices.edit');
    Route::delete('settings/devices', [DevicesController::class, 'destroyAll'])->name('devices.destroyAll');
    Route::delete('settings/devices/{sessionId}', [DevicesController::class, 'destroy'])->name('devices.destroy');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');
});

<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Fortify\Features;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
});

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register', function () {
    $this->withSession(['security_check_code' => 'ABCDE']);

    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'phone' => '081234567890',
        'security_check' => 'ABCDE',
        'password' => 'Password1!',
        'password_confirmation' => 'Password1!',
    ]);

    $this->assertGuest();
    $response->assertRedirect(route('verify.email.notice'));

    $this->assertDatabaseHas('users', [
        'email' => 'test@example.com',
    ]);
});

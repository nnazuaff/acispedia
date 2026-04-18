<?php

use App\Models\Suggestion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('authenticated user can open kotak saran page', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('kotak-saran'));
    $response->assertOk();
});

test('authenticated user can submit suggestion', function () {
    $user = User::factory()->create([
        'name' => 'Budi',
        'phone' => '081234567890',
    ]);

    $this->actingAs($user);

    $response = $this->post(route('kotak-saran.store'), [
        'name' => 'Budi',
        'phone' => '081234567890',
        'category' => 'saran',
        'message' => 'Tolong tambah metode pembayaran baru.',
    ]);

    $response->assertRedirect();

    expect(Suggestion::query()->count())->toBe(1);

    $row = Suggestion::query()->first();
    expect((int) $row->user_id)->toBe((int) $user->id);
    expect($row->category)->toBe('saran');
});

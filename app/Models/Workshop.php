<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Workshop extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'title',
        'instructor',
        'location',
        'description',
        'scheduled_at',
        'capacity',
        'status',
        'created_by_user_id',
        'updated_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'capacity' => 'integer',
        ];
    }

    protected $appends = [
        'active_registrations_count',
        'seats_remaining',
    ];

    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class);
    }

    public function activeRegistrations(): HasMany
    {
        return $this->hasMany(Registration::class)->where('status', 'active');
    }

    public function waitlists(): HasMany
    {
        return $this->hasMany(Waitlist::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function getActiveRegistrationsCountAttribute(): int
    {
        return $this->registrations()->where('status', 'active')->count();
    }

    public function getSeatsRemainingAttribute(): int
    {
        return max(0, $this->capacity - $this->active_registrations_count);
    }
}

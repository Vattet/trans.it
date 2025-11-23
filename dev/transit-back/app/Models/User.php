<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens; 
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;
    protected $table = 'User';
    protected $primaryKey = 'ID';
    public $timestamps = false;

    protected $fillable = [
        'Nom',
        'Prenom',
        'Email',
        'Mot_de_passe',
        'IsActive',
        'IsAdmin',
        'Date_Update',
        'Date_Creation',
    ];

    protected $casts = [
        'IsActive' => 'boolean',
        'IsAdmin' => 'boolean',
        'Date_Update' => 'datetime',
        'Date_Creation' => 'datetime',
    ];

    // Relations
    public function documents()
    {
        return $this->hasMany(Document::class, 'Id_User', 'ID');
    }

    public function parametre()
    {
        return $this->hasOne(ParametreUser::class, 'Id_User', 'ID');
    }
}

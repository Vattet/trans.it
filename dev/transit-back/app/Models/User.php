<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $table = 'User';
    protected $primaryKey = 'ID';
    public $timestamps = false;

    protected $fillable = [
        'Nom',
        'Prenom',
        'Email',
        'Mot_de_passe',
        'IsActive',
        'Date_Update',
        'Date_Creation',
    ];

    protected $casts = [
        'IsActive' => 'boolean',
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

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ParametreUser extends Model
{
    protected $table = 'Parametre_User';
    protected $primaryKey = 'ID';
    public $timestamps = false;

    protected $fillable = [
        'Id_User',
        'Notification_Mail',
        'Langue',
        'Date_Update',
        'Date_Creation',
    ];

    protected $casts = [
        'Notification_Mail' => 'boolean',
        'Date_Update' => 'datetime',
        'Date_Creation' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'Id_User', 'ID');
    }
}

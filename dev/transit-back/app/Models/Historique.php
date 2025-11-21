<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Historique extends Model
{
    protected $table = 'Historique';
    protected $primaryKey = 'ID';
    public $timestamps = false;

    protected $fillable = [
        'Id_Lien',
        'Action',
        'Adresse_IP',
        'Date_Update',
        'Date_Creation',
    ];

    protected $casts = [
        'Date_Update' => 'datetime',
        'Date_Creation' => 'datetime',
    ];

    public function lien()
    {
        return $this->belongsTo(Lien::class, 'Id_Lien', 'ID');
    }
}

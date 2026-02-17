<?php

namespace App\Notifications;

use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LowStockNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Product $product) {}

    public function via(object $notifiable): array
    {
        return ["mail", "database"];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("⚠️ Low Stock Alert: " . $this->product->name)
            ->greeting("Hello " . $notifiable->name . ",")
            ->line("The product **{$this->product->name}** (SKU: {$this->product->sku}) has reached a low stock level.")
            ->line("Current Stock: **{$this->product->current_stock}** {$this->product->unit}")
            ->line("Minimum Stock Level: **{$this->product->minimum_stock}** {$this->product->unit}")
            ->action("View Product", url("/products/{$this->product->id}"))
            ->line("Please restock this item as soon as possible.");
    }

    public function toArray(object $notifiable): array
    {
        return [
            "product_id" => $this->product->id,
            "product_name" => $this->product->name,
            "product_sku" => $this->product->sku,
            "current_stock" => $this->product->current_stock,
            "minimum_stock" => $this->product->minimum_stock,
        ];
    }
}

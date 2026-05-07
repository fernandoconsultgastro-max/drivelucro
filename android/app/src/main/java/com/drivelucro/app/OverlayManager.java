package com.drivelucro.app;

import android.content.Context;
import android.graphics.PixelFormat;
import android.view.Gravity;
import android.view.WindowManager;
import android.widget.TextView;

public class OverlayManager {

    private final Context context;
    private WindowManager windowManager;
    private TextView overlayView;

    public OverlayManager(Context context) {
        this.context = context;
    }

    public void mostrarOverlay(String texto) {

        if (overlayView != null) return;

        windowManager =
                (WindowManager) context.getSystemService(Context.WINDOW_SERVICE);

        overlayView = new TextView(context);

        overlayView.setText(texto);

        overlayView.setTextSize(18);

        overlayView.setPadding(40, 40, 40, 40);

        overlayView.setBackgroundColor(0xCC000000);

        overlayView.setTextColor(0xFF00FF00);

        WindowManager.LayoutParams params =
                new WindowManager.LayoutParams(
                        WindowManager.LayoutParams.WRAP_CONTENT,
                        WindowManager.LayoutParams.WRAP_CONTENT,
                        WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
                        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                        PixelFormat.TRANSLUCENT
                );

        params.gravity = Gravity.TOP | Gravity.CENTER_HORIZONTAL;

        params.y = 200;

        windowManager.addView(overlayView, params);
    }

    public void removerOverlay() {

        if (overlayView != null && windowManager != null) {

            windowManager.removeView(overlayView);

            overlayView = null;
        }
    }
}
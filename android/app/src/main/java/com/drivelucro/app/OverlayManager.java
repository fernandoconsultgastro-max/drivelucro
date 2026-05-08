package com.drivelucro.app;

import android.app.Activity;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.graphics.Typeface;
import android.view.Gravity;
import android.view.WindowManager;
import android.widget.LinearLayout;
import android.widget.TextView;

public class OverlayManager {

    private final Activity activity;

    private WindowManager windowManager;

    private LinearLayout overlayView;

    public OverlayManager(Activity activity) {
        this.activity = activity;
    }

    public void mostrarOverlay(String texto) {

        if (overlayView != null) return;

        windowManager =
                (WindowManager) activity.getSystemService(Activity.WINDOW_SERVICE);

        overlayView = new LinearLayout(activity);

        overlayView.setOrientation(LinearLayout.VERTICAL);

        overlayView.setPadding(40, 40, 40, 40);

        overlayView.setBackgroundColor(Color.parseColor("#CC111111"));

        TextView titulo = new TextView(activity);

        titulo.setText("DriveLucro Copiloto");

        titulo.setTextColor(Color.WHITE);

        titulo.setTextSize(18);

        titulo.setTypeface(null, Typeface.BOLD);

        TextView decisao = new TextView(activity);

        decisao.setText("ACEITAR");

        decisao.setTextColor(Color.GREEN);

        decisao.setTextSize(26);

        decisao.setTypeface(null, Typeface.BOLD);

        TextView detalhes = new TextView(activity);

        detalhes.setText(texto);

        detalhes.setTextColor(Color.WHITE);

        detalhes.setTextSize(15);

        overlayView.addView(titulo);

        overlayView.addView(decisao);

        overlayView.addView(detalhes);

        WindowManager.LayoutParams params =
                new WindowManager.LayoutParams(
                        WindowManager.LayoutParams.WRAP_CONTENT,
                        WindowManager.LayoutParams.WRAP_CONTENT,
                        WindowManager.LayoutParams.TYPE_APPLICATION_PANEL,
                        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                        PixelFormat.TRANSLUCENT
                );

        params.gravity = Gravity.TOP | Gravity.CENTER_HORIZONTAL;

        params.y = 220;

        windowManager.addView(overlayView, params);
    }

    public void removerOverlay() {

        if (overlayView != null && windowManager != null) {

            windowManager.removeView(overlayView);

            overlayView = null;
        }
    }
}
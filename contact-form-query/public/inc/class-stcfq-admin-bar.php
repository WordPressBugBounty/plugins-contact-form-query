<?php
defined( 'ABSPATH' ) || die();
require_once STCFQ_PLUGIN_DIR_PATH . 'includes/class-stcfq-helper.php';

class STCFQ_Admin_Bar {
	public static function admin_bar_menu() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		global $wp_admin_bar, $wp_version;

		if ( ! is_object( $wp_admin_bar ) ) {
			return;
		}

		$messages_count = absint( STCFQ_Helper::unanswered_messages_count() );

		$version = isset( $wp_version ) ? preg_replace( '/-.*$/', '', $wp_version ) : '0';

		if ( version_compare( $version, '7.2', '>=' ) ) {
			$icon = '<span class="ab-icon svg-icon" aria-hidden="true"><svg aria-hidden="true" focusable="false" height="24" width="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: none" stroke="currentColor" stroke-width="1.5">
				<path d="M20.25 8.5V7C20.25 6.30964 19.6904 5.75 19 5.75H5C4.30964 5.75 3.75 6.30964 3.75 7V8.5M20.25 8.5V17C20.25 17.6904 19.6904 18.25 19 18.25H5C4.30964 18.25 3.75 17.6904 3.75 17V8.5M20.25 8.5L12 14.5L3.75 8.5"></path></svg></span>';
		} else {
			$icon = '<span class="ab-icon" aria-hidden="true"></span>';
		}

		$wp_admin_bar->add_menu(
			array(
				'id'    => 'stcfq-messages-count',
				'title' => $icon .
					'<span class="ab-label count-' . esc_attr( $messages_count ) . '" aria-hidden="true">' .
					esc_html( $messages_count ) .
					'</span>' .
					'<span class="screen-reader-text">' .
					esc_html(
						sprintf(
							/* translators: %d: Number of unanswered messages */
							_n(
								'%d Message not answered',
								'%d Messages not answered',
								$messages_count,
								'contact-form-query'
							),
							$messages_count
						)
					) .
					'</span>',
				'href'  => esc_url( admin_url( 'admin.php?page=stcfq_messages' ) ),
			)
		);
	}

	public static function admin_bar_menu_assets() {
		if ( current_user_can( 'manage_options' ) ) {
			wp_register_style( 'stcfq-admin-bar', STCFQ_PLUGIN_URL . 'assets/css/stcfq-admin-bar.css', array(), STCFQ_PLUGIN_VERSION, 'all' );
			wp_enqueue_style( 'stcfq-admin-bar' );
			wp_style_add_data( 'stcfq-admin-bar', 'rtl', 'replace' );
		}
	}
}

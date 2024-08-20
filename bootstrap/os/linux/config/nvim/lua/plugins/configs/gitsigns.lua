local status_ok, gitsigns = pcall(require, "gitsigns")
if not status_ok then
    return
end

gitsigns.setup({
    signs = {
        add = { text = "▎" },
        change = { text = "▎" },
        delete = { text = "契" },
        topdelete = { text = "契" },
        changedelete = { text = "▎" },
		untracked = { text = "" },
    },
	signs_staged = {
		add = { text = "▎" },
		change = { text = "▎" },
		delete = { text = "契" },
		topdelete = { text = "契" },
		changedelete = { text = "▎" },
		untracked = { text = "" },
	},
	signs_staged_enable = true,
    signcolumn = true, -- Toggle with `:Gitsigns toggle_signs`
    watch_gitdir = {
        interval = 1000,
        follow_files = true,
    },
	auto_attach = true,
    attach_to_untracked = true,
    current_line_blame_opts = {
        virt_text = true,
        virt_text_pos = "eol", -- 'eol' | 'overlay' | 'right_align'
        delay = 1000,
    },
    sign_priority = 6,
    update_debounce = 100,
    status_formatter = nil, -- Use default
    preview_config = {
        -- Options passed to nvim_open_win
        border = "single",
        style = "minimal",
        relative = "cursor",
        row = 0,
        col = 1,
    },
})
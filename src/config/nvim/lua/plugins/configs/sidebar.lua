local status_ok, sidebar = pcall(require, "sidebar-nvim")
if not status_ok then
    return
end

sidebar.setup({
    open = false
})
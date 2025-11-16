package main

import "errors"

var (
	ErrItemNotFound         = errors.New("item não encontrado")
	ErrInsufficientQuantity = errors.New("quantidade insuficiente no estoque")
)


package store

type Level struct {
	TemplateName  string `json:"templateName"`
	ID            int    `json:"id"`
	ObjectsHidden bool   `json:"objectsHidden"`
}

type Phase struct {
	Name        string  `json:"name"`
	Levels      []Level `json:"levels"`
	Interactive bool    `json:"interactive"`
}

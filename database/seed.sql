USE bakery_bloom;
INSERT INTO products(name,price,emoji,tag) VALUES

('Chocolate Fudge Cake',550,'🍫','Best seller'),
('Classic Vanilla Cake',500,'🍰',NULL),
('Red Velvet Cake',600,'❤️',NULL),
('Butter Croissant',120,'🥐',NULL),
('Cinnamon Roll',150,'🍥','Best seller'),
('Sourdough Loaf',250,'🍞',NULL),
('Baguette',100,'🥖',NULL);
INSERT INTO inventory(name,quantity,threshold,unit) VALUES ('Flour',22,10,'kg'),('Sugar',48,10,'kg'),('Cream',70,10,'L'),('Chocolate',85,10,'kg'),('Eggs',18,10,'dozen');
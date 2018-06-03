#pragma once
// ×î´ó¶Ñ
template<typename Index, typename T> class MaxHeap {

public:
	MaxHeap() : n(0) { }

	void add(Index i, T t) {
		num_tree.push_back(i);
		obj_tree.push_back(t);
		n = num_tree.size();

		FilterUp(n - 1);
	}

	Index getMax(T& t) {
		if (n > 0) {
			t = obj_tree[0];
			return num_tree[0];
		}
		else {
			return -1;
		}
	}

	bool removeMax() {
		if (n <= 0) return false;

		num_tree[0] = num_tree[n - 1]; obj_tree[0] = obj_tree[n - 1];
		--n;
		FilterDown(0);
		return true;
	}

	std::size_t size() { return obj_tree.size(); }

private:

	void FilterUp(int start) {

		Index num_temp = num_tree[start];
		T T_temp = obj_tree[start];

		int curr = start;
		int father = (curr - 1) / 2;

		while (curr > 0) {
			if (num_tree[father] >= num_temp) break;
			else {
				num_tree[curr] = num_tree[father];  obj_tree[curr] = obj_tree[father];
				curr = father;
				father = (curr - 1) / 2;
			}
		}
		num_tree[curr] = num_temp;  obj_tree[curr] = T_temp;
	}

	void FilterDown(int start) {

		Index num_temp = num_tree[start];
		T T_temp = obj_tree[start];

		int curr = start;
		int son = curr * 2 + 1;

		while (son < n) {
			// test l-son and r-son
			if (son < n - 1 && num_tree[son] < num_tree[son + 1]) son = son + 1;
			if (num_tree[son] <= num_temp) break;
			else {
				num_tree[curr] = num_tree[son]; obj_tree[curr] = obj_tree[son];
				curr = son;
				son = curr * 2 + 1;
			}
		}

		num_tree[curr] = num_temp; obj_tree[curr] = T_temp;
	}

	int n;
	vector<Index> num_tree;
	vector<T> obj_tree;

};